## A javascript function for text hyphenation in HTML documents. ##
  1. [Short\_description.](#.md)
  1. [When\_to\_use\_this\_script.](#.md)
  1. [How\_to\_use\_this\_script.](#.md)

<p>
<h3>Short description</h3>
Hardhyphenation is a javascript function used for to break long strings inside html content that normally the browsers doesn't know how to deal with.<br>
<ul><li>In some cases it will stretch the containig element and in this way will break the layout.<br>
</li><li>In others the string will continue outside of the element and eventually overlaping any other content.<br>
<table><thead><th> broken </th><th> <img src='http://hyphenation.googlecode.com/svn/trunk/Hardhyphenation_api/images/out.jpg' /> </th></thead><tbody>
<tr><td> good </td><td> <img src='http://hyphenation.googlecode.com/svn/trunk/Hardhyphenation_api/images/hyphenated.jpg' /> </td></tr></li></ul></tbody></table>

<ul><li>Another possible case according to the style rulls applied is the text to be clipped in the end of the element.<br>
</p>
<p>
<h3>When to use this script.</h3></li></ul>

</p>
<p>
<h3>How to use this script.</h3>
</p>
<h4>
1. Hyphenation using <code>&lt;wbr&gt;</code> tag (zero-width space):<br>
<pre><code>Hyphenation.run('H', {0:'#block1'});</code></pre>
</h4>
<h4>
2. Hyphenation using &shy; entity (soft hyphen char):<br>
<pre><code>Hyphenation.run('S', {0:'#block1'});</code></pre>
3. Hyphenation using two or more selectors:<br>
<pre><code>Hyphenation.run('H', {0:'#test', 1:'.descr'});</code></pre>
</h4>